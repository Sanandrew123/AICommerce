"""
推荐系统API路由

心理过程：
1. 提供个性化推荐接口
2. 支持不同推荐策略
3. 缓存推荐结果提高性能
4. 记录推荐日志用于优化
"""

from flask import Blueprint, request, jsonify
from app.models.recommendation import RecommendationEngine
from app import redis_client
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

bp = Blueprint('recommendation', __name__, url_prefix='/recommendations')

# 全局推荐引擎实例（实际应用中应该使用依赖注入）
recommendation_engine = None

def get_recommendation_engine():
    """获取推荐引擎实例"""
    global recommendation_engine
    if recommendation_engine is None:
        recommendation_engine = RecommendationEngine()
        # 这里应该从数据库加载数据
        # 暂时使用示例数据
        _initialize_with_sample_data()
    return recommendation_engine

def _initialize_with_sample_data():
    """使用示例数据初始化推荐引擎"""
    sample_products = [
        {
            'id': 1,
            'name': 'iPhone 15 Pro',
            'description': '苹果最新款智能手机',
            'brand': 'Apple',
            'tags': '["smartphone", "apple", "5g"]',
            'rating': 4.8,
            'review_count': 150
        },
        {
            'id': 2,
            'name': 'MacBook Pro M3',
            'description': '苹果笔记本电脑',
            'brand': 'Apple',
            'tags': '["laptop", "apple", "m3"]',
            'rating': 4.9,
            'review_count': 89
        },
        {
            'id': 3,
            'name': 'Nike Air Max',
            'description': '经典运动鞋',
            'brand': 'Nike',
            'tags': '["shoes", "sports", "nike"]',
            'rating': 4.5,
            'review_count': 200
        },
        {
            'id': 4,
            'name': '编程珠玑',
            'description': '经典编程书籍',
            'brand': '机械工业出版社',
            'tags': '["programming", "book", "algorithm"]',
            'rating': 4.7,
            'review_count': 95
        }
    ]
    
    sample_behaviors = [
        {'user_id': 1, 'product_id': 1, 'behavior_type': 'VIEW'},
        {'user_id': 1, 'product_id': 2, 'behavior_type': 'CLICK'},
        {'user_id': 1, 'product_id': 3, 'behavior_type': 'ADD_TO_CART'},
        {'user_id': 2, 'product_id': 1, 'behavior_type': 'PURCHASE'},
        {'user_id': 2, 'product_id': 4, 'behavior_type': 'VIEW'},
    ]
    
    global recommendation_engine
    recommendation_engine.prepare_data(sample_products, sample_behaviors)

@bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_recommendations(user_id):
    """获取用户个性化推荐"""
    try:
        # 检查缓存
        cache_key = f"user_recommendations:{user_id}"
        cached_result = redis_client.get(cache_key) if redis_client else None
        
        if cached_result:
            return jsonify({
                'success': True,
                'recommendations': json.loads(cached_result),
                'cached': True
            })
        
        # 获取参数
        limit = request.args.get('limit', 10, type=int)
        strategy = request.args.get('strategy', 'hybrid')  # collaborative, content, hybrid
        
        engine = get_recommendation_engine()
        
        if strategy == 'collaborative':
            recommendations = engine.get_collaborative_recommendations(user_id, limit)
        elif strategy == 'content':
            # 基于内容的推荐需要参考商品
            product_id = request.args.get('product_id', type=int)
            if product_id:
                recommendations = engine.get_content_based_recommendations(product_id, limit)
            else:
                recommendations = engine.get_hybrid_recommendations(user_id=user_id, n_recommendations=limit)
        else:  # hybrid
            recommendations = engine.get_hybrid_recommendations(user_id=user_id, n_recommendations=limit)
        
        # 缓存结果
        if redis_client:
            redis_client.setex(cache_key, 300, json.dumps(recommendations))  # 缓存5分钟
        
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'strategy': strategy,
            'cached': False
        })
        
    except Exception as e:
        logger.error(f"获取用户推荐失败: {e}")
        return jsonify({
            'success': False,
            'message': '获取推荐失败',
            'error': str(e)
        }), 500

@bp.route('/similar/<int:product_id>', methods=['GET'])
def get_similar_products(product_id):
    """获取相似商品推荐"""
    try:
        # 检查缓存
        cache_key = f"similar_products:{product_id}"
        cached_result = redis_client.get(cache_key) if redis_client else None
        
        if cached_result:
            return jsonify({
                'success': True,
                'recommendations': json.loads(cached_result),
                'cached': True
            })
        
        limit = request.args.get('limit', 10, type=int)
        
        engine = get_recommendation_engine()
        recommendations = engine.get_content_based_recommendations(product_id, limit)
        
        # 缓存结果
        if redis_client:
            redis_client.setex(cache_key, 600, json.dumps(recommendations))  # 缓存10分钟
        
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'cached': False
        })
        
    except Exception as e:
        logger.error(f"获取相似商品推荐失败: {e}")
        return jsonify({
            'success': False,
            'message': '获取相似商品推荐失败',
            'error': str(e)
        }), 500

@bp.route('/popular', methods=['GET'])
def get_popular_recommendations():
    """获取热门商品推荐"""
    try:
        # 检查缓存
        cache_key = "popular_recommendations"
        cached_result = redis_client.get(cache_key) if redis_client else None
        
        if cached_result:
            return jsonify({
                'success': True,
                'recommendations': json.loads(cached_result),
                'cached': True
            })
        
        limit = request.args.get('limit', 10, type=int)
        
        engine = get_recommendation_engine()
        recommendations = engine._get_popular_items(limit)
        
        # 缓存结果
        if redis_client:
            redis_client.setex(cache_key, 1800, json.dumps(recommendations))  # 缓存30分钟
        
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'cached': False
        })
        
    except Exception as e:
        logger.error(f"获取热门推荐失败: {e}")
        return jsonify({
            'success': False,
            'message': '获取热门推荐失败',
            'error': str(e)
        }), 500

@bp.route('/context', methods=['POST'])
def get_contextual_recommendations():
    """获取上下文相关推荐"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        context = data.get('context', {})
        limit = data.get('limit', 10)
        
        # 构建缓存键
        cache_key = f"contextual_recommendations:{user_id}:{hash(str(context))}"
        cached_result = redis_client.get(cache_key) if redis_client else None
        
        if cached_result:
            return jsonify({
                'success': True,
                'recommendations': json.loads(cached_result),
                'cached': True
            })
        
        engine = get_recommendation_engine()
        recommendations = engine.get_hybrid_recommendations(
            user_id=user_id,
            context=context,
            n_recommendations=limit
        )
        
        # 缓存结果
        if redis_client:
            redis_client.setex(cache_key, 300, json.dumps(recommendations))  # 缓存5分钟
        
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'context': context,
            'cached': False
        })
        
    except Exception as e:
        logger.error(f"获取上下文推荐失败: {e}")
        return jsonify({
            'success': False,
            'message': '获取上下文推荐失败',
            'error': str(e)
        }), 500

@bp.route('/feedback', methods=['POST'])
def record_recommendation_feedback():
    """记录推荐反馈"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        product_id = data.get('product_id')
        feedback_type = data.get('feedback_type')  # 'like', 'dislike', 'click', 'purchase'
        
        # 这里应该记录到数据库中用于模型优化
        # 暂时记录到Redis
        feedback_key = f"recommendation_feedback:{user_id}:{product_id}"
        feedback_data = {
            'user_id': user_id,
            'product_id': product_id,
            'feedback_type': feedback_type,
            'timestamp': datetime.now().isoformat()
        }
        
        if redis_client:
            redis_client.setex(feedback_key, 86400, json.dumps(feedback_data))  # 缓存1天
        
        return jsonify({
            'success': True,
            'message': '反馈记录成功'
        })
        
    except Exception as e:
        logger.error(f"记录推荐反馈失败: {e}")
        return jsonify({
            'success': False,
            'message': '记录反馈失败',
            'error': str(e)
        }), 500