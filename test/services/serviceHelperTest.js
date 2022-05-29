const chai = require('chai');

const service = require('../../src/services/serviceHelper');

chai.use(require('chai-json-schema'));

module.exports = () => {
    describe('Service Helper Test', () => {
        it('19. should set timeout', (done) => {
            chai.expect(service.timeout(200));
            done();
        });

        it('20. should return message', (done) => {
            chai.expect(service.createDataMessage({message:'hello world!'})).to.be.jsonSchema({
                status: 'success',
                message: 'hello world!',
            });
            done(0);
        });

        it('21. should return success message', (done) => {
            chai.expect(service.createSuccessMessage({message:'this is a sample success message'}, {name:'test'}, {code:'000'})).to.be.jsonSchema({
                status: 'success',
                message: 'this is a sample success message',
                name: 'test',
                code: '000'
            });
            done(0);
        });

        it('22. should return warning message', (done) => {
            chai.expect(service.createWarningMessage({message:'this is a sample warning message'}, {name:'test'}, {code:'001'})).to.be.jsonSchema({
                status: 'warning',
                message: 'this is a sample warning message',
                name: 'test',
                code: '001'
            });
            done(0);
        });

        const createErrorMessage = ['this is a sample error message', undefined];
        for (const value of createErrorMessage) {
            it('23. should return error message', (done) => {
                chai.expect(service.createErrorMessage({message:value}, {name:'test'}, {code:'002'})).to.be.jsonSchema({
                    status: 'error',
                    message: value === undefined ? 'Unknown error' : value,
                    name: 'test',
                    code: '002'
                });
                done(0);
            });
        }

        const ensureBooleanTrue = [true, 1];
        for (const value of ensureBooleanTrue) {
            it('24. should return true boolean', (done) => {
                chai.expect(service.ensureBoolean(value)).to.equal(true);
                done(0);
            });
        }

        const ensureBooleanFalse = [false, 0];
        for (const value of ensureBooleanFalse) {
            it('25. should return false boolean', (done) => {
                chai.expect(service.ensureBoolean(value)).to.equal(false);
                done(0);
            });
        }
        
        const ensureNumber = [1, '1'];
        for (const value of ensureNumber) {
            it('26. should return number', (done) => {
                chai.expect(service.ensureNumber(value)).to.equal(1);
                done(0);
            });
        }

        const ensureObject = [{message:'test'}, '{"message":"test"}'];
        for (const value of ensureObject) {
            it('27. should return object', (done) => {
                chai.expect(service.ensureObject(value)).to.deep.equal({message:'test'});
                done(0);
            });
        }

        it('28. should return db not null', (done) => {
            chai.expect(service.connectMongoDb('mongodb://127.0.0.1:27017/')).to.not.be.null;
            done(0);
        });
        
    });
};