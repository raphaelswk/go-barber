import React, { useRef, useCallback } from 'react';
import * as Yup from 'yup';
import { Link, useHistory } from 'react-router-dom';

import { FiLogIn, FiMail, FiLock } from 'react-icons/fi';
import { Form } from '@unform/web';
import { FormHandles } from '@unform/core';

import logoImg from '../../assets/logo.svg';

import Input from '../../components/Input';
import Button from '../../components/Button';

import { Container, Content, Background, AnimationContainer } from './styles';
import getValidationErrors from '../../utils/getValidationError';
import { useAuth } from '../../hooks/auth';
import { useToast } from '../../hooks/toast';

interface SignInFormData {
    email: string;
    password: string;
}

const SignIn: React.FC = () => {
    const formRef = useRef<FormHandles>(null);

    const { signIn } = useAuth();
    const { addToast } = useToast();
    const history = useHistory();

    const handleSubmit = useCallback(async (data: SignInFormData) => {
        try {
            formRef.current?.setErrors({});

            const schema = Yup.object().shape({
                email: Yup.string().required('Email is required').email('Type a valid email'),
                password: Yup.string().required('Password is required'),
            });

            await schema.validate(data, {
                abortEarly: false,
            });

            await signIn({ 
                email: data.email,
                password: data.password
             });

             history.push('/dashboard');
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                const errors = getValidationErrors(err);
                formRef.current?.setErrors(errors);
            }

            addToast({
                type: 'error',
                title: 'Authentication error',
                description: 'An error has occurred on the login process, please check your credentials'
            });
        }
    }, [signIn, addToast, history]);

    return (
        <Container>
            <Content>
                <AnimationContainer>
                    <img src={logoImg} alt="GoBarber"/>
                    <Form ref={formRef} onSubmit={handleSubmit}>
                        <h1>Log in</h1>

                        <Input name="email" icon={FiMail} type="email" placeholder="Email"/>

                        <Input name="password" icon={FiLock} type="password" placeholder="Password"/>

                        <Button type="submit">
                            Login
                        </Button>

                        <Link to="forgot-password">Forgot my password</Link>
                    </Form>

                    <Link to="/signup">
                        <FiLogIn />
                        Create account                
                    </Link>
                </AnimationContainer>                
            </Content>
            <Background />
        </Container>
    );
}

export default SignIn;