import { useState } from 'react'
import { AppBar, IconButton, Box, Toolbar, Menu, MenuItem } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import { Button } from '@aws-amplify/ui-react';
import Login from './Login';
import logo from './icons/firewatch2.png'

function Header({ username, authStatus, signOut, menuIconAction }) {
    const [loginOverlay, setLoginOverlay] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState(null);

    function signInButtonHandler() {
        setLoginOverlay(true);
    }

    function loginExitButtonHandler() {
        setLoginOverlay(false);
    }

    function handleUserMenu(event) {
        setMenuAnchor(event.currentTarget);
    }

    function handleMenuClose() {
        setMenuAnchor(null);
    }

    function handleLogout(){
        signOut();
        handleMenuClose();
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton
                        size='large'
                        edge='start'
                        color='inherit'
                        onClick={menuIconAction}
                    >
                        <MenuIcon />
                    </IconButton>
                    <img src={logo} alt="logo" style={{margin: 'auto', maxHeight: '64px', textAlign: 'center'}} />


                    {authStatus && (
                        <div>
                            <IconButton
                                size='large'
                                edge='end'
                                color='inherit'
                                onClick={handleUserMenu}
                            >
                                {username}
                            </IconButton>
                            <Menu
                                anchorEl={menuAnchor}
                                keepMounted
                                open={Boolean(menuAnchor)}
                                onClose={handleMenuClose}
                            >
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </Menu>
                        </div>
                    )}

                    {!authStatus && (
                        <Button onClick={signInButtonHandler}>Login</Button>
                    )}

                </Toolbar>
            </AppBar>
            {loginOverlay && <Login closeHandler={loginExitButtonHandler} />}
        </Box>

    )
}

export default Header;