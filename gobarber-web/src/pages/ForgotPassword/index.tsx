import React, { useRef, useCallback, useState } from 'react';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';

import { FiArrowLeft, FiMail } from 'react-icons/fi';
import { Form } from '@unform/web';
import { FormHandles } from '@unform/core';

import logoImg from '../../assets/logo.svg';

import Input from '../../components/Input';
import Button from '../../components/Button';

import { Container, Content, Background, AnimationContainer } from './styles';
import getValidationErrors from '../../utils/getValidationError';
import { useToast } from '../../hooks/toast';
import api from '../../services/api';

interface ForgotPasswordFormData {
    email: string;
    password: string;
}

const ForgotPassword: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const formRef = useRef<FormHandles>(null);

    const { addToast } = useToast();

    const handleSubmit = useCallback(async (data: ForgotPasswordFormData) => {
        try {
            setLoading(true);
            
            formRef.current?.setErrors({});

            const schema = Yup.object().shape({
                email: Yup.string()
                    .required('Email is required')
                    .email('Type a valid email'),
            });

            await schema.validate(data, {
                abortEarly: false,
            });

            await api.post('/password/forgot', {
                email: data.email,
            });

            addToast({
                type: 'success',
                title: 'Recovery email sent',
                description: 'The recovery email has been sent to your email inbox.'
            });
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                const errors = getValidationErrors(err);
                formRef.current?.setErrors(errors);
            }

            addToast({
                type: 'error',
                title: 'Forgot password error',
                description: 'An error has occurred on the password recovery process, please try again'
            });
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    return (
        <Container>
            <Content>
                <AnimationContainer>
                    <img src={logoImg} alt="GoBarber"/>
                    <Form ref={formRef} onSubmit={handleSubmit}>
                        <h1>Reset your password</h1>

                        <Input name="email" icon={FiMail} type="email" placeholder="Email"/>

                        <Button loading={loading} type="submit">
                            Send password reset email
                        </Button>
                    </Form>

                    <Link to="/">
                        <FiArrowLeft />                        
                        Back to login
                    </Link>
                </AnimationContainer>                
            </Content>
            <Background />
        </Container>
    );
}

export default ForgotPassword;