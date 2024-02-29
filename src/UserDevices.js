import AddDevice from "./AddDevice";
import {Tabs} from '@aws-amplify/ui-react'

function UserDevices({ submitAction, locations }) {
    return (
        <div>
            <Tabs
                items={[
                    {
                        label: "Manage Devices",
                        value: '1',
                        content: 'TODO'
                    },
                    {
                        label: "Add Device",
                        value: '2',
                        content: (
                            <AddDevice submitAction={submitAction}/>
                        )
                    }
                ]}
            />
        </div>
    );
}

export default UserDevices;