from django import template

register = template.Library()


@register.filter(name='initials')
def initials(fullname):
    val = ''
    for name in fullname.split(' '):
        if name and len(val) < 3:
            val += name[0].upper()
    return val
