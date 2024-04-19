import AddDevice from "./AddDevice";
import AddSubscription from "./AddSubscription";
import CancelSub from "./cancelSub";
import {Tabs} from '@aws-amplify/ui-react';

function UserDevices({ submitAction_2, submitAction_3, submitAction_4, queryAction}) {
    return (
        <div>
            <Tabs
                items={[
                    {
                        label: "Add Device",
                        value: '1',
                        content: (
                            <AddDevice submitAction={submitAction_2}/>
                        )
                    },
                    {
                        label: "Add Subscription",
                        value: '2',
                        content: (
                            <AddSubscription submitAction={submitAction_3}/>
                        )
                    },
                    {
                        label: "Cancel Subscription",
                        value: '3',
                        content: (
                            <CancelSub queryAction={queryAction} submitAction={submitAction_4}/>
                        )
                    }
                ]}
            />
        </div>
    );
}

export default UserDevices;