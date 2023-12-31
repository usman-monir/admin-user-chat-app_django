from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.utils.timesince import timesince
from .templatetags.initials import initials
from account.models import User
from .models import Message, Room
import json

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print('connect')
        self.room_name = self.scope['url_route']['kwargs'].get('room_name')
        self.room_group_name = f'chat_{self.room_name}'
        self.room = await self.get_room()
        self.user = self.scope['user']

        # join the room
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        # waits for the incoming request
        await self.accept()
        # Inform user
        if self.user.is_staff:
            await self.save_room_agent()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'agent_joined'
                }
            )


    async def disconnect(self, code):
        print('disconnect')
        # leave the room
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        if self.user.is_staff:
            await self.close_room()

    async def receive(self, text_data):
        print('receive')
        # Receive message from WebSocket (front end)
        text_data_json = json.loads(text_data)
        type = text_data_json['type']
        message = text_data_json.get('message', '')
        name = text_data_json.get('name', '')
        agent = text_data_json.get('agent', '')

        if type == 'message':
            # send message to group room
            new_message = await self.save_new_message_to_db(name, message, agent)
            await self.channel_layer.group_send(self.room_group_name,
                {
                  'type': 'chat_message',
                    'message': message,
                    'name': name,
                    'agent': agent,
                    'initials': initials(name),
                    'created_at': timesince(new_message.created_at),
                })
        elif type == 'agent_typing':
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'agent_typing',
            })
        elif type == 'agent_clear_typing':
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'agent_clear_typing',
            })
        elif type == 'customer_typing':
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'customer_typing',
            })
        elif type == 'customer_clear_typing':
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'customer_clear_typing',
            })

    async def chat_message(self, event):
        print('chat message')
        # send message to socket( frontend )
        await self.send(text_data=json.dumps({
            'type': event['type'],
            'message': event['message'],
            'name': event['name'],
            'agent': event['agent'],
            'initials': event['initials'],
            'created_at': event['created_at'],
        }))

    async def agent_joined(self, event):
        await self.send(text_data=json.dumps(
            {
                'type': event['type'],
            }
        ))

    async def agent_typing(self, event):
        await self.send(text_data=json.dumps({
            'type': event['type'],
        }))

    async def agent_clear_typing(self, event):
        await self.send(text_data=json.dumps({
            'type': event['type'],
        }))

    async def customer_typing(self, event):
        await self.send(text_data=json.dumps({
            'type': event['type'],
        }))

    async def customer_clear_typing(self, event):
        await self.send(text_data=json.dumps({
            'type': event['type'],
        }))

    @sync_to_async
    def close_room(self):
        self.room = Room.objects.get(uuid=self.room_name)
        self.room.status = 'closed'
        self.room.save()

    @sync_to_async
    def get_room(self):
        return Room.objects.get(uuid=self.room_name)


    @sync_to_async
    def save_room_agent(self):
        self.room = Room.objects.get(uuid=self.room_name)
        self.room.agent = self.user
        self.room.save()

    @sync_to_async
    def save_new_message_to_db(self,sent_by, message, agent):
        message = Message.objects.create(content = message, sent_by = sent_by)
        if agent:
            message.created_by = User.objects.get(pk = agent )
            message.save()

        self.room.messages.add(message)
        return message
