import json

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import Group
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.decorators.http import require_POST
from django.db.models import Q

from account.forms import AddUserForm, EditUserForm
from account.models import User

from .models import Room


@require_POST
def create_room(request, uuid):
    name = request.POST.get('name', '')
    url = request.POST.get('url', '')

    Room.objects.create(uuid=uuid, room_name=name, created_by = request.user, url=url)

    return JsonResponse({'message': 'room created'})


@login_required
def admin(request):
    if request.user.role == 'customer':
        rooms= request.user.rooms_created.all()
    elif request.user.is_superuser:
        rooms = Room.objects.all()
    else:
        rooms = Room.objects.filter(  Q(agent=request.user) | Q(agent=None))
    users = User.objects.filter(is_staff=True)
    customers = User.objects.filter(is_staff=False , role='customer')

    return render(request, 'chat/admin.html', {
        'rooms': rooms,
        'users': users,
        'customers': customers,
        })


@login_required
def room(request, uuid):
    room = Room.objects.get(uuid=uuid)
    if request.user.role != 'customer':
        if room.status == 'waiting':
            room.status = 'active'
            room.agent = request.user
            room.save()
        elif room.status == 'closed':
            room.status = 'active'
            room.agent = request.user
            room.save()
    return render(request, 'chat/room.html', {
        'room': room
    })


@login_required
def delete_room(request, uuid):
    if request.user.has_perm('room.delete_room') or request.user.role == 'customer':
        room = Room.objects.get(uuid=uuid)
        room.delete()
        messages.success(request, 'Room has been deleted successfully!')
        return redirect('/chat-admin/')

    messages.error(request, 'You don\'t have permission to delete the room')
    return redirect('/chat-admin/')


@login_required
def add_user(request):
    if request.method == 'POST':
        form = AddUserForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_staff = True
            user.set_password(request.POST.get('password'))
            user.save()
        if user.role == User.MANAGER:
            group = Group.objects.get(name='Managers')
            group.user_set.add(user)
            group.save()

        messages.success(request, 'User has been added successfully')
        return redirect('/chat-admin/')

    form = AddUserForm()
    return render(request, 'chat/add_user.html', {'form': form})

@login_required
def user_detail(request, uuid):
    user = User.objects.get(id=uuid)
    rooms = user.rooms.all()
    return render(request, 'chat/user_detail.html', {'user': user, 'rooms': rooms})


@login_required
def edit_user(request, uuid):
    user = User.objects.get(id=uuid)
    if request.method == 'POST':
        form = EditUserForm(request.POST, instance=user)
        if form.is_valid():
            user = form.save(commit=False)
            if user.role == 'agent' or user.role == 'manager':
                user.is_staff = True
            else:
                user.is_staff = False
            user.save()
            messages.success(request, 'User has been updated successfully')
            print('done')
            return redirect('/chat-admin/')

    form = EditUserForm(instance=user)
    return render(request, 'chat/edit_user.html', {'form': form})
