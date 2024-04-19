import React, { useState, useEffect } from 'react';
import { Button } from '@aws-amplify/ui-react';

function CancelSub({ queryAction, submitAction }) {
    const [data, setData] = useState([]); 
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);  // State to track createTime of the selected item

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await queryAction();
                setData(result); 
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };   
        fetchData();
    }, []);

    function handleItemClick(index) {
        setSelectedItem(index);
        setSelectedTime(data[index].createTime.N); 
    }

    const params = {
        createTime: selectedTime,
    };

    function formSubmitHandler(e) {
        e.preventDefault();
        submitAction(params);
    }

    return (
        <div>
            <ul>
                {data.map((item, index) => (
                    <li 
                        key={index}
                        onClick={() => handleItemClick(index)}
                        style={{
                            cursor: 'pointer',
                            backgroundColor: selectedItem === index ? '#b3d9ff' : '',
                            padding: '5px',
                            margin: '5px'
                        }}
                    >
                        Longitude: {item.lon.N}, Latitude: {item.lat.N} 
                    </li>
                ))}
            </ul>
            <form onSubmit={formSubmitHandler}>
                <Button type="submit">Unsubscribe</Button>
            </form>
        </div>
    );
}

export default CancelSub;
