"""
智能客服服务

心理过程：
1. 基于规则的对话系统
2. 意图识别和实体提取
3. 商品查询和推荐
4. 常见问题自动回答
"""

import re
import json
import jieba
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

class ChatBotService:
    def __init__(self):
        self.intents = self._load_intents()
        self.product_keywords = self._load_product_keywords()
        
    def _load_intents(self) -> Dict:
        """加载意图识别规则"""
        return {
            'greeting': {
                'patterns': ['你好', '您好', '客服', '在吗'],
                'responses': [
                    '您好！我是AI智能客服，很高兴为您服务！',
                    '欢迎来到我们的商城！有什么可以帮助您的吗？',
                    '您好！请问有什么需要帮助的吗？'
                ]
            },
            'product_search': {
                'patterns': ['找', '搜索', '查找', '有没有', '推荐'],
                'responses': [
                    '我来帮您搜索相关商品...',
                    '正在为您查找商品信息...',
                    '让我为您推荐一些商品...'
                ]
            },
            'price_inquiry': {
                'patterns': ['价格', '多少钱', '费用', '成本'],
                'responses': [
                    '关于价格信息，让我为您查询...',
                    '商品价格信息如下：'
                ]
            },
            'order_status': {
                'patterns': ['订单', '物流', '发货', '快递'],
                'responses': [
                    '请提供您的订单号，我来为您查询订单状态',
                    '关于订单问题，我来帮您处理'
                ]
            },
            'return_policy': {
                'patterns': ['退货', '退款', '换货', '售后'],
                'responses': [
                    '我们支持7天无理由退货，15天换货服务',
                    '关于售后服务，请告诉我具体遇到了什么问题'
                ]
            },
            'shipping': {
                'patterns': ['配送', '送货', '运费', '包邮'],
                'responses': [
                    '我们提供全国包邮服务，一般3-7天送达',
                    '配送时间根据您的地址而定，大部分地区2-5天到达'
                ]
            }
        }
    
    def _load_product_keywords(self) -> Dict:
        """加载商品关键词"""
        return {
            '手机': ['iPhone', 'Android', '华为', '小米', '三星'],
            '电脑': ['MacBook', '笔记本', '台式机', '显示器'],
            '服装': ['衣服', '裤子', '裙子', '外套', '鞋子'],
            '家电': ['冰箱', '洗衣机', '空调', '电视'],
            '图书': ['小说', '教材', '技术书', '漫画']
        }
    
    def process_message(self, message: str, user_id: Optional[int] = None, 
                       session_id: Optional[str] = None) -> Dict[str, Any]:
        """处理用户消息"""
        try:
            # 预处理消息
            cleaned_message = self._preprocess_message(message)
            
            # 意图识别
            intent = self._classify_intent(cleaned_message)
            
            # 实体提取
            entities = self._extract_entities(cleaned_message)
            
            # 生成响应
            response = self._generate_response(intent, entities, cleaned_message)
            
            return {
                'success': True,
                'response': response,
                'intent': intent,
                'entities': entities,
                'suggestions': self._get_suggestions(intent)
            }
            
        except Exception as e:
            logger.error(f"处理消息失败: {e}")
            return {
                'success': False,
                'response': '抱歉，我遇到了一些问题，请稍后再试或联系人工客服。',
                'intent': 'error',
                'entities': {},
                'suggestions': ['联系人工客服', '重新提问']
            }
    
    def _preprocess_message(self, message: str) -> str:
        """预处理用户消息"""
        # 移除多余空格和特殊字符
        cleaned = re.sub(r'\s+', ' ', message.strip())
        # 转换为小写（对中文不适用，但保留逻辑）
        return cleaned
    
    def _classify_intent(self, message: str) -> str:
        """意图分类"""
        message_words = jieba.lcut(message)
        
        intent_scores = {}
        for intent, config in self.intents.items():
            score = 0
            for pattern in config['patterns']:
                if pattern in message:
                    score += 2
                # 检查分词后的匹配
                for word in message_words:
                    if pattern in word or word in pattern:
                        score += 1
            intent_scores[intent] = score
        
        # 返回得分最高的意图
        if intent_scores:
            best_intent = max(intent_scores, key=intent_scores.get)
            if intent_scores[best_intent] > 0:
                return best_intent
        
        return 'general'
    
    def _extract_entities(self, message: str) -> Dict[str, List[str]]:
        """实体提取"""
        entities = {
            'products': [],
            'brands': [],
            'categories': [],
            'price_range': [],
            'numbers': []
        }
        
        # 提取商品类别
        for category, keywords in self.product_keywords.items():
            for keyword in keywords:
                if keyword in message:
                    entities['products'].append(keyword)
                    entities['categories'].append(category)
        
        # 提取价格信息
        price_patterns = [
            r'(\d+)元',
            r'(\d+)块',
            r'(\d+)-(\d+)',
            r'(\d+)到(\d+)'
        ]
        
        for pattern in price_patterns:
            matches = re.findall(pattern, message)
            if matches:
                entities['price_range'].extend([match for match in matches if match])
        
        # 提取数字
        numbers = re.findall(r'\d+', message)
        entities['numbers'] = numbers
        
        return entities
    
    def _generate_response(self, intent: str, entities: Dict, message: str) -> str:
        """生成响应"""
        if intent in self.intents:
            base_response = self.intents[intent]['responses'][0]
            
            # 根据意图和实体定制响应
            if intent == 'product_search' and entities.get('products'):
                products = entities['products']
                return f"我找到了关于{', '.join(products)}的商品，让我为您推荐几款：\n• 商品1：高性价比选择\n• 商品2：热门推荐\n• 商品3：最新款式\n\n您想了解哪一款的详细信息？"
            
            elif intent == 'price_inquiry' and entities.get('price_range'):
                return f"根据您的价格要求，我为您推荐以下商品：\n{base_response}"
            
            elif intent == 'order_status':
                return "请提供您的订单号（通常是10-15位数字），我来为您查询具体的订单状态和物流信息。"
            
            return base_response
        
        # 默认响应
        return "感谢您的咨询！如果您有具体的商品需求，可以告诉我商品名称或类别，我会为您推荐合适的商品。您也可以询问价格、配送、售后等问题。"
    
    def _get_suggestions(self, intent: str) -> List[str]:
        """获取建议回复"""
        suggestion_map = {
            'greeting': ['查看商品', '搜索商品', '查询订单', '了解售后'],
            'product_search': ['查看详情', '比较价格', '查看评价', '加入购物车'],
            'price_inquiry': ['查看折扣', '比较商品', '查看规格'],
            'order_status': ['查看物流', '修改地址', '联系快递', '申请退款'],
            'return_policy': ['申请退货', '查看条件', '联系客服'],
            'shipping': ['查看运费', '选择快递', '预约配送']
        }
        
        return suggestion_map.get(intent, ['查看商品', '联系客服', '查询订单'])
    
    def get_product_recommendations_by_query(self, query: str, limit: int = 5) -> List[Dict]:
        """根据查询获取商品推荐"""
        # 这里应该调用商品服务API
        # 暂时返回模拟数据
        return [
            {
                'id': 1,
                'name': f'推荐商品 {i+1}',
                'price': f'{100 + i*50}',
                'image': f'/images/product_{i+1}.jpg',
                'rating': 4.5 + i*0.1
            }
            for i in range(limit)
        ]