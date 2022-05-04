echo "Destroying old containers"

sudo docker stop todo-app-db
sudo docker stop todo-app-db-admin

sudo docker rm todo-app-db
sudo docker rm todo-app-db-admin

echo "Creating postgres database container..."
sudo docker run -d --name todo-app-db -e POSTGRES_PASSWORD=sinthy4949 -p 9000:5432 postgres

echo "Creating postgres database admin container..."
sudo docker run -d --name todo-app-db-admin -p 9001:5050 -d thajeztah/pgadmin4

sudo docker container ls