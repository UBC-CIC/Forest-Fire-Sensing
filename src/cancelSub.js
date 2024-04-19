import React, { useState, useEffect } from 'react';
import { Button, List, ListItem, ListItemText, Box } from '@mui/material';

function CancelSub({ queryAction, submitAction }) {
    const [data, setData] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [loading, setLoading] = useState(false);  // Tracks loading state for async operations

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await queryAction();
            setData(result);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    function handleItemClick(index) {
        setSelectedItem(index);
        setSelectedTime(data[index].createTime.N);
    }

    const params = {
        createTime: selectedTime,
    };

    async function formSubmitHandler(e) {
        e.preventDefault();
        if (loading) return;  // Prevents multiple submissions during loading
        await submitAction(params);
        fetchData();  // Refresh data after submitting
    }

    return (
        <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            <List>
                {data.map((item, index) => (
                    <ListItem
                        key={index}
                        button
                        onClick={() => handleItemClick(index)}
                        selected={selectedItem === index}
                        sx={{
                            bgcolor: selectedItem === index ? 'primary.light' : '',
                            my: 0.5,
                            cursor: 'pointer'
                        }}
                    >
                        <ListItemText primary={`Longitude: ${item.lon.N}, Latitude: ${item.lat.N}`} />
                    </ListItem>
                ))}
            </List>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button variant="contained" type="submit" onClick={formSubmitHandler} disabled={loading}>
                    {loading ? 'Processing...' : 'Unsubscribe'}
                </Button>
            </Box>
        </Box>
    );
}

export default CancelSub;
