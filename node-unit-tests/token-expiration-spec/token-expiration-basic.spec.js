"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const expect = require("expect");
const NeoJs_1 = require("../NeoJs");
const aigle_1 = require("aigle");
const _ = require("lodash");
let neo = new NeoJs_1.default({
    scriptHash: '6d4b0074c7e46fc371281832e8575048740bfa8e'
});
let addressAsByteArray = neo.sc.ContractParam.byteArray(neo.config.myAddress, 'address');
let otherAddress = neo.sc.ContractParam.byteArray('Aea1mQwHmpBGU6Ss6Y2qX3hAX6jooKiXBX', 'address');
let hasMinted = false;
describe("Token Expiration", function () {
    this.timeout(50000);
    before(async () => {
        let result = await neo.get('totalSupply', []);
        if (result[0].value === '') {
            console.log('MINTING 2 TOKENS!!!');
            await neo.call('mintToken', [addressAsByteArray]);
            await neo.call('mintToken', [addressAsByteArray]);
            await neo.call('mintToken', [addressAsByteArray]);
            await neo.call('mintToken', [addressAsByteArray]);
            hasMinted = true;
        }
    });
    it('should return 04 balanceOf for my address', async () => {
        let result = await neo.get('balanceOf', [addressAsByteArray]);
        expect(result[0].value).toEqual('04');
    });
    it('should return empty balanceOf for wrong address', async () => {
        let result = await neo.get('balanceOf', [neo.sc.ContractParam.byteArray(neo.config.myAddress.replace('A', 'S'), 'address')]);
        expect(result[0].value).toEqual('');
    });
    it('should return 04 totalSupply', async () => {
        let result = await neo.get('totalSupply', [addressAsByteArray]);
        expect(result[0].value).toEqual('04');
    });
    describe("tokens of owner", function () {
        let tokenIds;
        before(async () => {
            let tokensOfOwnerResult = await neo.get('tokensOfOwner', [addressAsByteArray]);
            tokenIds = _.map(tokensOfOwnerResult[0].value, 'value');
        });
        it('4 tokens minted', async () => {
            expect(tokenIds.length).toEqual(4);
        });
        it('owner of tokens is me', async () => {
            await aigle_1.default.forEach(tokenIds, async (tokenId) => {
                let tokensOfOwnerResult = await neo.get('ownerOf', [tokenId]);
                expect(tokensOfOwnerResult[0].value).toEqual(addressAsByteArray.value);
            });
        });
        describe('Lend', () => {
            before(async () => {
                if (hasMinted) {
                    return;
                }
            });
            it('should not have active Lend on fresh token', async () => {
                let result = await neo.get('isLendActive', [tokenIds[0]]);
                expect(result[0].value).toEqual('');
            });
            it('should have Lend active on Lent token', async () => {
                let result = await neo.get('isLendActive', [tokenIds[1]]);
                expect(result[0].value).toEqual('1');
            });
        });
        describe('Lend short period and return', () => {
            before(async () => {
                if (hasMinted) {
                    return;
                }
            });
            it('should not have active Lend on fresh token', async () => {
                let result = await neo.get('isLendActive', [tokenIds[0]]);
                expect(result[0].value).toEqual('');
            });
            it('should still have lend on long token', async () => {
                let result = await neo.get('isLendActive', [tokenIds[1]]);
                expect(result[0].value).toEqual('1');
            });
            it('should not have active Lend on returned token', async () => {
                let result = await neo.get('isLendActive', [tokenIds[3]]);
                expect(result[0].value).toEqual('');
            });
            it('returned token should have the ownerOf the original owner', async () => {
                let result = await neo.get('ownerOf', [tokenIds[3]]);
                expect(result[0].value).toEqual(addressAsByteArray.value);
            });
        });
    });
});
//# sourceMappingURL=token-expiration-basic.spec.js.map