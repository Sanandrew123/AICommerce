"""
推荐系统模型

心理过程：
1. 实现协同过滤推荐算法
2. 基于内容的推荐算法
3. 混合推荐策略
4. 冷启动问题处理
"""

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
from typing import List, Dict, Any, Optional
import json
import logging

logger = logging.getLogger(__name__)

class RecommendationEngine:
    def __init__(self):
        self.user_item_matrix = None
        self.item_features_matrix = None
        self.tfidf_vectorizer = None
        self.svd_model = None
        
    def prepare_data(self, products_data: List[Dict], user_behaviors: List[Dict]) -> None:
        """准备推荐所需的数据"""
        try:
            # 处理商品数据
            self.products_df = pd.DataFrame(products_data)
            if 'tags' in self.products_df.columns:
                self.products_df['tags'] = self.products_df['tags'].apply(
                    lambda x: ' '.join(json.loads(x) if isinstance(x, str) else x) if x else ''
                )
            
            # 处理用户行为数据
            if user_behaviors:
                self.behaviors_df = pd.DataFrame(user_behaviors)
                self._build_user_item_matrix()
            
            # 构建商品特征矩阵
            self._build_item_features_matrix()
            
            logger.info("推荐数据准备完成")
        except Exception as e:
            logger.error(f"数据准备失败: {e}")
            raise
    
    def _build_user_item_matrix(self) -> None:
        """构建用户-商品交互矩阵"""
        # 为不同行为类型分配权重
        behavior_weights = {
            'VIEW': 1,
            'CLICK': 2,
            'ADD_TO_CART': 4,
            'PURCHASE': 10
        }
        
        # 计算用户对商品的评分
        self.behaviors_df['score'] = self.behaviors_df['behavior_type'].map(behavior_weights).fillna(1)
        
        # 聚合用户对商品的总评分
        user_item_scores = self.behaviors_df.groupby(['user_id', 'product_id'])['score'].sum().reset_index()
        
        # 创建用户-商品矩阵
        self.user_item_matrix = user_item_scores.pivot(
            index='user_id', 
            columns='product_id', 
            values='score'
        ).fillna(0)
        
        # 训练SVD模型用于协同过滤
        if len(self.user_item_matrix) > 1:
            self.svd_model = TruncatedSVD(n_components=min(50, min(self.user_item_matrix.shape) - 1))
            self.user_factors = self.svd_model.fit_transform(self.user_item_matrix)
            self.item_factors = self.svd_model.components_.T
    
    def _build_item_features_matrix(self) -> None:
        """构建商品特征矩阵"""
        # 合并商品描述和标签作为特征文本
        feature_texts = []
        for _, product in self.products_df.iterrows():
            text_features = []
            if pd.notna(product.get('name')):
                text_features.append(product['name'])
            if pd.notna(product.get('description')):
                text_features.append(product['description'])
            if pd.notna(product.get('brand')):
                text_features.append(product['brand'])
            if pd.notna(product.get('tags')):
                text_features.append(product['tags'])
            
            feature_texts.append(' '.join(text_features))
        
        # 使用TF-IDF向量化
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words=None,  # 可以添加中文停用词
            ngram_range=(1, 2)
        )
        
        self.item_features_matrix = self.tfidf_vectorizer.fit_transform(feature_texts)
    
    def get_collaborative_recommendations(self, user_id: int, n_recommendations: int = 10) -> List[Dict]:
        """协同过滤推荐"""
        if self.user_item_matrix is None or self.svd_model is None:
            return []
        
        try:
            if user_id not in self.user_item_matrix.index:
                return self._get_popular_items(n_recommendations)
            
            user_idx = self.user_item_matrix.index.get_loc(user_id)
            user_vector = self.user_factors[user_idx]
            
            # 计算用户对所有商品的预测评分
            predicted_scores = np.dot(user_vector, self.item_factors.T)
            
            # 获取用户已交互的商品
            interacted_items = set(self.user_item_matrix.columns[self.user_item_matrix.loc[user_id] > 0])
            
            # 排序并过滤已交互的商品
            item_scores = []
            for i, product_id in enumerate(self.user_item_matrix.columns):
                if product_id not in interacted_items:
                    item_scores.append((product_id, predicted_scores[i]))
            
            item_scores.sort(key=lambda x: x[1], reverse=True)
            
            # 返回推荐结果
            recommendations = []
            for product_id, score in item_scores[:n_recommendations]:
                product_info = self.products_df[self.products_df['id'] == product_id].iloc[0].to_dict()
                recommendations.append({
                    'product_id': int(product_id),
                    'score': float(score),
                    'reason': '基于相似用户喜好',
                    'product_info': product_info
                })
            
            return recommendations
        except Exception as e:
            logger.error(f"协同过滤推荐失败: {e}")
            return self._get_popular_items(n_recommendations)
    
    def get_content_based_recommendations(self, product_id: int, n_recommendations: int = 10) -> List[Dict]:
        """基于内容的推荐"""
        try:
            if product_id not in self.products_df['id'].values:
                return []
            
            product_idx = self.products_df[self.products_df['id'] == product_id].index[0]
            
            # 计算与目标商品的相似度
            similarity_scores = cosine_similarity(
                self.item_features_matrix[product_idx:product_idx+1],
                self.item_features_matrix
            ).flatten()
            
            # 排序获取最相似的商品
            similar_indices = similarity_scores.argsort()[::-1][1:n_recommendations+1]  # 排除自己
            
            recommendations = []
            for idx in similar_indices:
                similar_product = self.products_df.iloc[idx]
                recommendations.append({
                    'product_id': int(similar_product['id']),
                    'score': float(similarity_scores[idx]),
                    'reason': '商品特征相似',
                    'product_info': similar_product.to_dict()
                })
            
            return recommendations
        except Exception as e:
            logger.error(f"基于内容推荐失败: {e}")
            return []
    
    def get_hybrid_recommendations(self, user_id: Optional[int] = None, 
                                 context: Optional[Dict] = None,
                                 n_recommendations: int = 10) -> List[Dict]:
        """混合推荐策略"""
        recommendations = []
        
        # 如果有用户ID，使用协同过滤
        if user_id:
            collab_recs = self.get_collaborative_recommendations(user_id, n_recommendations)
            for rec in collab_recs:
                rec['source'] = 'collaborative'
                recommendations.append(rec)
        
        # 如果有上下文（如正在浏览的商品），使用基于内容的推荐
        if context and 'current_product_id' in context:
            content_recs = self.get_content_based_recommendations(
                context['current_product_id'], n_recommendations
            )
            for rec in content_recs:
                rec['source'] = 'content'
                recommendations.append(rec)
        
        # 如果推荐数量不足，补充热门商品
        if len(recommendations) < n_recommendations:
            popular_recs = self._get_popular_items(n_recommendations - len(recommendations))
            for rec in popular_recs:
                rec['source'] = 'popular'
                recommendations.append(rec)
        
        # 去重并按评分排序
        seen_products = set()
        unique_recommendations = []
        for rec in recommendations:
            if rec['product_id'] not in seen_products:
                seen_products.add(rec['product_id'])
                unique_recommendations.append(rec)
        
        unique_recommendations.sort(key=lambda x: x['score'], reverse=True)
        return unique_recommendations[:n_recommendations]
    
    def _get_popular_items(self, n_recommendations: int = 10) -> List[Dict]:
        """获取热门商品作为默认推荐"""
        try:
            # 按评分和评价数量排序
            popular_products = self.products_df.sort_values(
                ['rating', 'review_count'], 
                ascending=False
            ).head(n_recommendations)
            
            recommendations = []
            for _, product in popular_products.iterrows():
                recommendations.append({
                    'product_id': int(product['id']),
                    'score': float(product.get('rating', 0)),
                    'reason': '热门商品',
                    'product_info': product.to_dict()
                })
            
            return recommendations
        except Exception as e:
            logger.error(f"获取热门商品失败: {e}")
            return []