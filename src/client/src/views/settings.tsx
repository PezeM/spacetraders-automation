import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import {selectSettings, updateSettings} from "../features/settings/settingsSlice";
import {Button, Card, Col, Form, Input, InputNumber, message, Row, Select} from "antd";
import {useForm} from "antd/es/form/Form";

const layout = {
    labelCol: {span: 8},
    wrapperCol: {span: 8},
};

const tailLayout = {
    wrapperCol: {offset: 8, span: 16},
};

export const SettingsView = () => {
    const [form] = useForm();
    const settings = useSelector(selectSettings);
    const dispatch = useDispatch();

    const onFinish = async (values: any) => {
        console.log('form finish values:', values);
        dispatch(updateSettings(values));
        await message.success("Successfully updated settings.");
    };

    const onFinishFailed = async (errorInfo: any) => {
        await message.error("Couldn't update settings values.");
    };

    return (
        <Card title="Settings" loading={false}>
            <Row justify="center">
                <Col span={12}>
                    <Form {...layout} name="settingsForm"
                          onFinish={onFinish}
                          onFinishFailed={onFinishFailed}
                          form={form}
                          initialValues={{...settings}}>
                        <Form.Item name="baseUrl" label="Server address" tooltip="URL address of the server"
                                   rules={[{
                                       required: true,
                                       message: 'Please input address of the server',
                                       type: "string"
                                   }]}>
                            <Input/>
                        </Form.Item>

                        <Form.Item name="port" label="Server port" tooltip="Port of the server"
                                   rules={[{
                                       required: true,
                                       message: 'Please input port of the server',
                                       type: "number"
                                   }]}>
                            <InputNumber min={0} max={99999}/>
                        </Form.Item>

                        <Form.Item name="theme" label="Theme" tooltip="Type of theme">
                            <Select>
                                <Select.Option value="dark">Dark</Select.Option>
                                <Select.Option value="light">Light</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item {...tailLayout}>
                            <Button type="primary" htmlType="submit">Update</Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </Card>
    )
}