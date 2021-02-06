import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IUsersRepository from '@modules/users/repositories/IUserRepository';
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider';

import User from '@modules/users/infra/typeorm/entities/User';
import { classToClass } from 'class-transformer';

interface IRequest {
  user_id: string;
}

@injectable()
class ListProvidersService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
  ) {}

  public async execute({ user_id }: IRequest): Promise<User[]> {
    let providers = await this.cacheProvider.recover<User[]>(
      `providers-list:${user_id}`
    );

    if (!providers) {
      providers = await this.usersRepository.findAllProviders({
        except_user_id: user_id
      });

      if (!providers) {
        throw new AppError('No providers found');
      }

      await this.cacheProvider.save(
        `providers-list:${user_id}`,
        classToClass(providers));
    }

    return providers;
  }
}

export default ListProvidersService;
