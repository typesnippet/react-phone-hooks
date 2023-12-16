import AntDemo from "./AntDemo";
import MuiDemo from "./MuiDemo";

const Demo = () => {
    return (
        <div style={{display: "flex"}}>
            <div style={{width: "50vw", height: "100vh"}}>
                <AntDemo/>
            </div>
            <div style={{width: "50vw", height: "100vh"}}>
                <MuiDemo/>
            </div>
        </div>
    )
}

export default Demo;
