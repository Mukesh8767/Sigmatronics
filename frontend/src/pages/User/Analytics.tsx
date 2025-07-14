import UserWrapper from "../Wrappers/UserWrapper"
import { MachineDataAnalysis } from "./MachineDataAnalysis"

export const UserAnalytics=()=>{
    return <UserWrapper>
        <MachineDataAnalysis/>
    </UserWrapper>
}