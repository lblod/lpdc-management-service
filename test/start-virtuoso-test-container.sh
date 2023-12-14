echo "Stopping and removing containers"
docker compose -p lpdc-management-service-tests stop
docker compose -p lpdc-management-service-tests down --remove-orphans

echo "Clearing test data"
rm -rf data-tests

docker compose -p lpdc-management-service-tests pull
docker compose -p lpdc-management-service-tests up -d