---
title: "Setting up a website with Ansible"
date: 2019-12-15
source: hugo
---

## Create VPS

Create a new VPS (virtual private server), I chose to host my VPS on [DigitalOcean](https://www.digitalocean.com). I've already uploaded my Mac's public key to DigitalOcean, so it is installed automatically. This will allow ansible to connect without a password.

The ansible and config files I use are at the bottom of this post.

## Initial config

```sh
ansible-playbook initial_server_setup.yml -i hosts -l nickbodmer.com -u root
```

This initial configuration playbook will:

- create 'wheel' group (which probably already exists)
- enable passwordless sudo
- create my user 'nick' with sudo privileges
- add my ssh key to that new user
- disable password authentication for root
- update apt
- install a few packages, most importantly UFW firewall
- allow SSH through the firewall
- enable the firewall

## nginx setup

```sh
ansible-playbook -i hosts -l nickbodmer.com nginx.yml
```

This playbook will:

- Install and start nginx
- open ports 80 and 443 for http and https
- copy the nginx config file to the server
- symlink the config file to sites-enabled
- restart nginx

At this point we have a fully running http webserver.

## letsencrypt using certbot

certbot will automatically configure nginx to use https and set a cron job to automatically renew your certificates.

Add certbot repository:

```sh
sudo add-apt-repository ppa:certbot/certbot
```

Install certbot for nginx:

```sh
sudo apt install python-certbot-nginx
```

Install cert for domain:

```sh
sudo certbot --nginx -d nickbodmer.com -d www.nickbodmer.com
```

## Files needed

hosts

```ini
[cloud]
nickbodmer.com

[cloud:vars]
ansible_python_interpreter=/usr/bin/python3

[local]
192.168.1.206
```

initial\_server\_setup.yml

```yaml
###########################################################################################################
# DO Community Playbooks
# Playbook: Initial Server Setup
# Based on: https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-18-04
# Dedicated Guide: https://www.digitalocean.com/community/tutorials/automating-initial-server-setup-with-ansible
###################################################################################################################

---
- hosts: all
  remote_user: root
  gather_facts: false
  vars:
    create_user: nick
    copy_local_key: "{{ lookup('file', lookup('env','HOME') + '/.ssh/id_rsa.pub') }}"
    sys_packages: [ 'curl', 'vim', 'git', 'ufw']

  tasks:
    - name: Make sure we have a 'wheel' group
      group:
        name: wheel
        state: present

    - name: Allow 'wheel' group to have passwordless sudo
      lineinfile:
        path: /etc/sudoers
        state: present
        regexp: '^%wheel'
        line: '%wheel ALL=(ALL) NOPASSWD: ALL'
        validate: '/usr/sbin/visudo -cf %s'

    - name: Create a new regular user with sudo privileges
      user:
        name: "{{ create_user }}"
        state: present
        groups: wheel
        append: true
        create_home: true
        shell: /bin/bash

    - name: Set authorized key for remote user
      authorized_key:
        user: "{{ create_user }}"
        state: present
        key: "{{ copy_local_key }}"

    - name: Disable password authentication for root
      lineinfile:
        path: /etc/ssh/sshd_config
        state: present
        regexp: '^#?PermitRootLogin'
        line: 'PermitRootLogin prohibit-password'

    - name: Update apt
      apt: update_cache=yes

    - name: Install required system packages
      apt: name={{ sys_packages }} state=latest

    - name: UFW - Allow SSH connections
      ufw:
        rule: allow
        name: OpenSSH

    - name: UFW - Deny all other incoming traffic by default
      ufw:
        state: enabled
        policy: deny
        direction: incoming
```

nginx\_config.cfg

```nginx
server {
       listen 80;
       listen [::]:80;

       server_name nickbodmer.com www.nickbodmer.com;

       root /home/nick/nickbodmer.com/;
       index index.html;

       location / {
               try_files $uri $uri/ =404;
       }
}
```

nginx.yml

```yaml
---
- hosts: all
  tasks:
    - name: ensure nginx is at the latest version
      apt: name=nginx state=latest
      become: yes
    - name: start nginx
      service:
          name: nginx
          state: started
      become: yes
    - name: UFW - Allow http/https connections
      ufw:
        rule: allow
        name: 'Nginx Full'
      become: yes
    - name: copy the nginx config file and restart nginx
      copy:
        src: /Users/nick/Google Drive/Sync/Documents/Ansible/nginx_config.cfg
        dest: /etc/nginx/sites-available/nginx_config.cfg
      become: yes
    - name: create symlink
      file:
        src: /etc/nginx/sites-available/nginx_config.cfg
        dest: /etc/nginx/sites-enabled/default
        state: link
      become: yes
    - name: restart nginx
      service:
        name: nginx
        state: restarted
      become: yes
```
