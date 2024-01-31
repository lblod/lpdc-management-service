

export default class LPDCError {
    //TODO LPDC-768: status is a REST concept, not a domain concept; now this class is used in domain
    constructor(public status: number, public message: string) {
    }

}