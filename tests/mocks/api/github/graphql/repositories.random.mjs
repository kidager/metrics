/**Mocked data */
export default function({faker, query, login = faker.internet.username()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > repositories/random")
  return ({
    user: {
      repositories: {
        nodes: [
          {nameWithOwner: "lowlighter/metrics"},
        ],
      },
    },
  })
}
