const { buildSchema } = require("graphql");

const schema = buildSchema(`
    schema {
        query: RootQuery
    }

    type RootQuery {
        hello: TestData
    }

    type TestData {
        text: String!
        views: Int!
    }
    `);

module.exports = schema;