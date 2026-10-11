/**Mocked data */
export default function({faker, query, login = faker.internet.username()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > achievements/organizations")
  return ({
    organization: {
      repositories: {
        nodes: [
          {
            createdAt: faker.date.recent(),
            nameWithOwner: `${faker.internet.username()}/${faker.lorem.slug()}`,
          },
        ],
        totalCount: faker.number.int(100),
      },
      forks: {
        nodes: [
          {
            createdAt: faker.date.recent(),
            nameWithOwner: `${faker.internet.username()}/${faker.lorem.slug()}`,
          },
        ],
        totalCount: faker.number.int(100),
      },
      popular: {
        nodes: [{stargazers: {totalCount: faker.number.int(50000)}}],
      },
      projects: {totalCount: faker.number.int(100)},
      packages: {totalCount: faker.number.int(100)},
      membersWithRole: {totalCount: faker.number.int(100)},
      sponsorshipsAsSponsor: {totalCount: faker.number.int(100)},
    },
  })
}
