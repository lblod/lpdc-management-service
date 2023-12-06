import {QUEUE_POLL_INTERVAL} from '../config';

export class ProcessingQueue {
    private name: string;
    private queue: any[];
    private executing: boolean;

    constructor(name = "default-processing-queue") {
        this.name = name;
        this.queue = [];
        this.run();
        this.executing = false; //This is useful for tracking state.
    }

    async run(): Promise<void> {
        if (this.queue.length > 0 && !this.executing) {
            try {
                this.executing = true;
                console.log(`${this.name}: Executing oldest task on queue`);
                await this.queue.shift()();
                console.log(`${this.name}: Remaining number of tasks ${this.queue.length}`);
            } catch (error) {
                const errorMsg = `${this.name}: Error while processing delta in queue ${error}`;
                console.error(errorMsg);
                console.log(error.stack)
            } finally {
                this.executing = false;
                this.run();
            }
        } else {
            setTimeout(() => {
                this.run();
            }, QUEUE_POLL_INTERVAL);
        }
    }

    addJob(origin): void {
        this.queue.push(origin);
    }
}
