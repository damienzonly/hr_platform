sudo rm -rf dbdata
docker compose down
docker system prune -f
docker compose up --build $@