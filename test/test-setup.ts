

async function waitUntilDatabaseStarted() {
    let waitTurn = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        waitTurn++;
        try {
            const result = await fetch("http://localhost:8899");
            if (result.status === 200) {
                console.log(`${new Date()} - Virtuoso running`);
                break;
            } else {
                console.log(`${new Date()} - Virtuoso running on status code ${result.status}`);
            }
        } catch (error) {
            //console.log(error);
        }
        console.log(`${new Date()} - Virtuoso not running on http://localhost:8899 with expected status code 200, retrying ... `);
        await wait(1000);
        if (waitTurn > 480) {
            console.log(`${new Date()} - Virtuoso not running on http://localhost:8899 with expected status code 200, stopped waiting after ${waitTurn} tries ... `);
            break;
        }
    }
}

function wait(milliseconds: number) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

module.exports = async () => {
    await waitUntilDatabaseStarted();
};