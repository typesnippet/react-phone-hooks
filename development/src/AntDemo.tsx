import {useState} from "react";
import Form from "antd/es/form";
import theme from "antd/es/theme";
import Input from "antd/es/input";
import Button from "antd/es/button";
import Card from "antd/es/card/Card";
import FormItem from "antd/es/form/FormItem";
import ConfigProvider from "antd/es/config-provider";

import PhoneInput from "./ant-phone";

import "antd/dist/reset.css";

const AntDemo = () => {
	const [value, setValue] = useState({});
	const [algorithm, setAlgorithm] = useState("defaultAlgorithm");

	const validator = (_: any, {valid}: any) => {
		if (valid()) {
			return Promise.resolve();
		}
		return Promise.reject("Invalid phone number");
	}

	const changeTheme = () => {
		if (algorithm === "defaultAlgorithm") {
			setAlgorithm("darkAlgorithm");
		} else {
			setAlgorithm("defaultAlgorithm");
		}
	}

	return (
		<ConfigProvider
			theme={{algorithm: algorithm === "defaultAlgorithm" ? theme.defaultAlgorithm : theme.darkAlgorithm}}>
			<Card style={{height: "100%", borderRadius: 0, border: "none"}} bodyStyle={{padding: 0}}>
				<div style={{margin: 20, maxWidth: 400}}>
					{value && (
						<pre style={{
							background: algorithm === "defaultAlgorithm" ? "#efefef" : "#1f1f1f",
							color: algorithm === "defaultAlgorithm" ? "#1f1f1f" : "#efefef",
							padding: 10, marginBottom: 24,
						}}>
                            {JSON.stringify(value, null, 2)}
                        </pre>
					)}
					<Form>
						<FormItem name="phone" rules={[{validator}]}>
							<PhoneInput enableSearch onChange={(e) => setValue(e as any)}/>
						</FormItem>
						<FormItem name="test">
							<Input/>
						</FormItem>
						<div style={{display: "flex", gap: 24}}>
							<Button htmlType="reset">Reset Value</Button>
							<Button onClick={changeTheme}>Change Theme</Button>
						</div>
					</Form>
				</div>
			</Card>
		</ConfigProvider>
	)
}

export default AntDemo;
