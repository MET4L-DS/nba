# Deployment Guide: AWS EC2 (LEMP Stack)

This guide explains how to host the PHP backend and MySQL database on an AWS EC2 instance using SSH with Nginx.

## Prerequisites

1.  **AWS Account**: You need an active AWS account.
2.  **SSH Client**: Terminal (Mac/Linux) or PowerShell/PuTTY (Windows).
3.  **Key Pair**: A `.pem` key pair file downloaded from AWS when creating the instance.

## Step 1: Launch EC2 Instance

1.  Go to the **AWS Console** > **EC2**.
2.  Click **Launch Instance**.
3.  **Name**: `NBA-Server`.
4.  **OS Image**: Choose **Ubuntu Server 22.04 LTS** (Free Tier eligible).
5.  **Instance Type**: `t2.micro` (Free Tier eligible) or larger.
6.  **Key Pair**: Create new or select existing (Download the `.pem` file).
7.  **Network Settings**:
    - Allow SSH traffic from **My IP** (more secure) or Anywhere.
    - Allow HTTP traffic from the internet.
    - Allow HTTPS traffic from the internet.
8.  **Launch Instance**.

## Step 2: Connect via SSH

1.  Open your terminal.
2.  Navigate to where your `.pem` key is located.
3.  Change permissions (if on Mac/Linux): `chmod 400 nba.pem`.
4.  Connect:
    ```bash
    ssh -i "nba.pem" ubuntu@13.233.109.6
    ```

## Step 3: Server Setup

1.  Once connected, you can use the provided setup script or run commands manually.
2.  Upload the setup script (run this from your local machine, not the EC2 terminal):
    ```bash
    scp -i "nba.pem" deployment/setup_aws.sh ubuntu@13.233.109.6:~/
    ```
3.  Back in the EC2 terminal, make it executable and run it:
    ```bash
    chmod +x setup_aws.sh
    sudo ./setup_aws.sh
    ```

## Step 4: Configure Database

1.  Secure MySQL installation (set root password, remove anonymous users, disallow root login remotely):
    ```bash
    sudo mysql_secure_installation
    ```
2.  Log in to MySQL:
    ```bash
    sudo mysql -u root -p
    ```
3.  Create Database and User (Run line by line):
    ```sql
    CREATE DATABASE nba_db;
    CREATE USER 'nba_user'@'localhost' IDENTIFIED BY 'TUnba@420';
    GRANT ALL PRIVILEGES ON nba_db.* TO 'nba_user'@'localhost';
    FLUSH PRIVILEGES;
    EXIT;
    ```
4.  Copy your database schema file to the server:
    ```bash
    # (From Local Machine)
    scp -i "nba.pem" docs/db.sql ubuntu@13.233.109.6:~/
    ```
5.  Import the schema:
    ```bash
    # (On EC2)
    mysql -u nba_user -p nba_db < db.sql
    ```

## Step 5: Upload Project Files

You can use `scp` or `git`. Using `git` is easier if your code is on GitHub.

### Option A: Using SCP (Copy files directly)

```bash
# (From Local Machine - run in project root)
# Copy the entire api folder and project structure
scp -i "nba.pem" -r api ubuntu@13.233.109.6:/var/www/html/nba/
```

_Note: You might need to create the directory `/var/www/html/nba` first on the server._

### Option B: Using Git (Recommended)

```bash
# (On EC2)
cd /var/www/html
git clone https://github.com/yourusername/your-repo.git nba
```

## Step 6: Configure Nginx

1.  Copy the nginx config:

    ```bash
    sudo nano /etc/nginx/sites-available/nba
    ```

    _Paste the contents of `deployment/nginx.conf` here. Make sure to update the `fastcgi_pass` socket path if your PHP version differs (check with `php -v`), and update the `DB_PASS`._

2.  Enable the site and restart Nginx:
    ```bash
    sudo ln -s /etc/nginx/sites-available/nba /etc/nginx/sites-enabled/
    sudo unlink /etc/nginx/sites-enabled/default
    sudo nginx -t  # Test configuration
    sudo systemctl restart nginx
    ```

## Step 7: Verify

Open your browser and visit: `http://13.233.109.6/api/index.php` (or your entry point).

## Troubleshooting

- **502 Bad Gateway**: This usually means PHP-FPM is not running or the socket path in `nginx.conf` is wrong.
    - Check socket: `ls /run/php/`
    - Check FPM status: `systemctl status php8.1-fpm` (adjust version)
    - Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- **Connection Refused**: Ensure Security Group for EC2 allows Inbound Traffic on Port 80.
- **Database Error**: Check the credentials in `nginx.conf` matching what you set in Step 4.
