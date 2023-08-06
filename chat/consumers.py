from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
import json

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs'].get('room_name')
        self.room_group_name = f'chat_{self.room_name}'
        # join the room
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        # waits for the incoming request
        await self.accept()

    async def disconnect(self, code):
        # leave the room
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
