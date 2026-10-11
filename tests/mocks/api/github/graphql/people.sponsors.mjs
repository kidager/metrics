/**Mocked data */
export default function({faker, query, login = faker.internet.username()}) {
  console.debug("metrics/compute/mocks > mocking graphql api result > people/sponsors")
  const type = query.match(/(?<type>sponsorshipsAsSponsor|sponsorshipsAsMaintainer)[(]/)?.groups?.type ?? "(unknown type)"
  return /after: "MOCKED_CURSOR"/m.test(query)
    ? ({
      user: {
        login,
        [type]: {
          edges: [],
        },
      },
    })
    : ({
      user: {
        login,
        [type]: {
          edges: new Array(Math.ceil(20 + 80 * Math.random())).fill(null).map((login = faker.internet.username()) => ({
            cursor: "MOCKED_CURSOR",
            node: {
              sponsorEntity: {
                login: faker.internet.username(),
                avatarUrl: null,
              },
              sponsorable: {
                login: faker.internet.username(),
                avatarUrl: null,
              },
            },
          })),
        },
      },
    })
}
