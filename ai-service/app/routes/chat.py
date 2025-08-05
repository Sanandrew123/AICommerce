"""
智能客服API路由
"""

from flask import Blueprint, request, jsonify
from app.services.chat_service import ChatBotService
from app import redis_client
import json
import uuid
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

bp = Blueprint('chat', __name__, url_prefix='/chat')

# 全局聊天机器人实例
chatbot_service = ChatBotService()

@bp.route('/message', methods=['POST'])
def process_chat_message():
    """处理聊天消息"""
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        user_id = data.get('user_id')
        session_id = data.get('session_id') or str(uuid.uuid4())
        
        if not message:
            return jsonify({
                'success': False,
                'message': '消息不能为空'
            }), 400
        
        # 处理消息
        result = chatbot_service.process_message(message, user_id, session_id)
        
        # 记录聊天历史
        if redis_client:
            chat_history_key = f"chat_history:{session_id}"
            chat_entry = {
                'message': message,
                'response': result['response'],
                'timestamp': datetime.now().isoformat(),
                'intent': result['intent']
            }
            redis_client.lpush(chat_history_key, json.dumps(chat_entry))
            redis_client.expire(chat_history_key, 3600)  # 1小时过期
        
        return jsonify({
            'success': True,
            'response': result['response'],
            'intent': result['intent'],
            'suggestions': result['suggestions'],
            'session_id': session_id
        })
        
    except Exception as e:
        logger.error(f"处理聊天消息失败: {e}")
        return jsonify({
            'success': False,
            'message': '处理消息时出现错误',
            'error': str(e)
        }), 500

@bp.route('/history/<session_id>', methods=['GET'])
def get_chat_history(session_id):
    """获取聊天历史"""
    try:
        if not redis_client:
            return jsonify({
                'success': False,
                'message': 'Redis未配置'
            }), 500
        
        chat_history_key = f"chat_history:{session_id}"
        history_data = redis_client.lrange(chat_history_key, 0, -1)
        
        history = []
        for entry_json in reversed(history_data):  # 反转以获得正确的时间顺序
            try:
                entry = json.loads(entry_json)
                history.append(entry)
            except json.JSONDecodeError:
                continue
        
        return jsonify({
            'success': True,
            'history': history,
            'session_id': session_id
        })
        
    except Exception as e:
        logger.error(f"获取聊天历史失败: {e}")
        return jsonify({
            'success': False,
            'message': '获取聊天历史失败',
            'error': str(e)
        }), 500

@bp.route('/sessions/<int:user_id>', methods=['GET'])
def get_user_chat_sessions(user_id):
    """获取用户的聊天会话列表"""
    try:
        # 这里应该从数据库查询用户的聊天会话
        # 暂时返回模拟数据
        sessions = [
            {
                'session_id': str(uuid.uuid4()),
                'last_message': '您好，有什么可以帮助您的吗？',
                'timestamp': '2024-01-15T10:30:00Z',
                'status': 'active'
            }
        ]
        
        return jsonify({
            'success': True,
            'sessions': sessions
        })
        
    except Exception as e:
        logger.error(f"获取用户聊天会话失败: {e}")
        return jsonify({
            'success': False,
            'message': '获取聊天会话失败',
            'error': str(e)
        }), 500