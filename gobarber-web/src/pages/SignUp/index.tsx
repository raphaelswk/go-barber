import React, { useCallback, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { FiArrowLeft, FiMail, FiUser, FiLock } from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import getValidationErrors from '../../utils/getValidationError';
import logoImg from '../../assets/logo.svg';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Container, Content, Background, AnimationContainer } from './styles';

import api from '../../services/api';

import { useToast } from '../../hooks/toast';

interface SignUpFormData {
    name: string;
    email: string;
    password: string;
}

const SignUp: React.FC = () => {
    const formRef = useRef<FormHandles>(null);
    const { addToast } = useToast();
    const history = useHistory();

    const handleSubmit = useCallback(async (data: SignUpFormData) => {
        try {            
            formRef.current?.setErrors({});

            const schema = Yup.object().shape({
                name: Yup.string().required('Name is required'),
                email: Yup.string().required('Email is required').email('Type a valid email'),
                password: Yup.string().min(6, 'At least 6 digits'),
            });

            await schema.validate(data, {
                abortEarly: false,
            });

            await api.post('/users', data);
            
            addToast({
                type: 'success',
                title: 'Your user was created successfully',
                description: 'You are already able to logon on GoBarber'
            });

            history.push('/');
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                const errors = getValidationErrors(err);
                formRef.current?.setErrors(errors);
            }

            addToast({
                type: 'error',
                title: 'Sign up error',
                description: 'An error has occurred on the sign up process, please try again'
            });
        }
    }, [addToast, history]);

    return (
        <Container>
            <Background />
            <Content>
                <AnimationContainer>
                    <img src={logoImg} alt="GoBarber"/>
                    <Form ref={formRef} onSubmit={handleSubmit}>
                        <h1>Register</h1>

                        <Input name="name" icon={FiUser} type="text" placeholder="Name"/>

                        <Input name="email" icon={FiMail} type="email" placeholder="Email"/>

                        <Input name="password" icon={FiLock} type="password" placeholder="Password"/>

                        <Button type="submit">
                            Register
                        </Button>

                        <a href="forgot">Forgot my password</a>
                    </Form>

                    <Link to="/">
                        <FiArrowLeft />
                        Back to logon
                    </Link>
                </AnimationContainer>
            </Content>
        </Container>
    );
};

export default SignUp;