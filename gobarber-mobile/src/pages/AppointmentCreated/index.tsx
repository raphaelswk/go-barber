import React, { useCallback, useMemo } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { format } from 'date-fns';

import { Container, Title, Decription, OkButton, OkButtonText } from './styles';

interface RouteParams {
  date: number;
}

const AppointmentCreated: React.FC = () => {
  const { reset } = useNavigation();
  const { params } = useRoute();

  const routeParams = params as RouteParams;

  const handleOkPressed = useCallback(() => {
    reset({
      routes: [{ name: 'Dashboard' }],
      index: 0,
    });
  }, [reset]);

  const formattedDate = useMemo(() => {
    return format(
      routeParams.date,
      "EEEE',' MMMM dd yyyy 'at' HH:mm");
  }, [routeParams.date]);

  return (
    <Container>
      <Icon name="check" size={80} color="#04d361" />

      <Title>The appointment has been booked</Title>
      <Decription>{formattedDate}</Decription>

      <OkButton onPress={handleOkPressed}>
        <OkButtonText>
          Ok
        </OkButtonText>
      </OkButton>
    </Container>
  )
}

export default AppointmentCreated;
