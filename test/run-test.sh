./start-virtuoso-test-container.sh

cd ..

echo "Running lint & tests"
npm ci
npm run lint
npm run test

echo "Stopping containers"
docker compose -p lpdc-management-service-tests down

cd test || exit