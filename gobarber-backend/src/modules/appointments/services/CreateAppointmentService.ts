import { startOfHour, isBefore, getHours, format } from 'date-fns';
import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Appointment from '../infra/typeorm/entities/Appointment';
import IAppointmentsRepository from '../repositories/IAppointmentsRepository';
import INotificationsRepository from '@modules/notifications/repositories/INotificationsRepository';
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider';

interface IRequest {
  provider_id: string;
  user_id: string;
  date: Date;
}

@injectable()
class CreateAppointmentService {
    // DEPENDENCY INVERSION
    // constructor(private appointmentsRepository: IAppointmentsRepository) {}

    constructor(
      @inject('AppointmentsRepository')
      private appointmentsRepository: IAppointmentsRepository,

      @inject('NotificationsRepository')
      private notificationsRepository: INotificationsRepository,

      @inject('CacheProvider')
      private cacheProvider: ICacheProvider,
    ) {}

    public async execute({
      provider_id,
      user_id,
      date
    }: IRequest): Promise<Appointment> {
        const appointmentDate = startOfHour(date);

        if (isBefore(appointmentDate, Date.now())) {
          throw new AppError("You can't create an appointment on a past date.");
        }

        if (user_id === provider_id) {
          throw new AppError("You can't create an appointment for yourself.");
        }

        if (getHours(appointmentDate) < 8 || getHours(appointmentDate) > 17) {
          throw new AppError("You can only create appointmentss between 8am and 5pm ");
        }

        const findAppointmentInSameDate = await this.appointmentsRepository.findByDate(
            appointmentDate,
            provider_id
        );

        if (findAppointmentInSameDate) {
            throw new AppError('This appointment is already booked');
        }

        const appointment = await this.appointmentsRepository.create({
            provider_id,
            user_id,
            date: appointmentDate,
        });

        const formattedDate = format(appointmentDate, "dd/MM/yyyy 'at' HH:mm")

        await this.notificationsRepository.create({
          recipient_id: provider_id,
          content: `You have a new appointment on ${formattedDate}`
        });

        await this.cacheProvider.invalidade(
          `provider-appointments:${provider_id}:${format(appointmentDate, 'yyyy-M-d')}`
        );

        return appointment;
    }
}

export default CreateAppointmentService;
