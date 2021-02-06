import FakeUserRepository from '@modules/users/repositories/fakes/FakeUserRepository';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import ListProvidersService from './ListProvidersService';

let fakeUserRepository: FakeUserRepository;
let fakeCacheProvider: FakeCacheProvider;
let listProvider: ListProvidersService;

describe('ListProviders', () => {
  beforeEach(() => {
    fakeUserRepository = new FakeUserRepository();
    fakeCacheProvider = new FakeCacheProvider();
    listProvider = new ListProvidersService(
      fakeUserRepository,
      fakeCacheProvider,
    );
  })

  it('should be able to list the providers', async () => {
    const user1 = await fakeUserRepository.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: '123456'
    });

    const user2 = await fakeUserRepository.create({
      name: 'John Tre',
      email: 'john.Tre@example.com',
      password: '123456'
    });

    const loggedUser = await fakeUserRepository.create({
      name: 'John Qua',
      email: 'john.qua@example.com',
      password: '123456'
    });

    const providers = await listProvider.execute({
      user_id: loggedUser.id
    });

    expect(providers).toEqual([user1, user2]);
  });
});
