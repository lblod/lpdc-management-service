import {pepingenBestuurseenheid} from "./bestuureenheid-test-builder";

test('getUUID extracts the UUID from the id', () => {

    const pepingenUUID = '73840d393bd94828f0903e8357c7f328d4bf4b8fbd63adbfa443e784f056a589';

    expect(pepingenBestuurseenheid().uuid).toEqual(pepingenUUID);

});