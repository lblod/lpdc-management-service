./start-virtuoso-test-container.sh

cd ..

echo "Running lint & tests"
npm ci
npm run lint
exit_code_lint=$?
npm run test
exit_code_test=$?

if [ $exit_code_lint -eq 1 ] || [ $exit_code_test -eq 1 ]; then
    exit_code=1
else
    exit_code=0
fi

echo "Stopping containers"
docker compose -p lpdc-management-service-tests down

cd test
exit exit_code