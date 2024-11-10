import { Button, Box, Typography } from '@mui/material';

import Window from './Window';


function FormWindow({ isOpen, onClose, onSubmit, title, buttonText, children }) {

    return (
        <Window isOpen={isOpen} onClose={onClose}>
  
          <Typography variant='title'>
            {title}
          </Typography>
  
          <Box component='form'
            onSubmit={onSubmit}
            sx={{ display: 'flex', flexDirection: 'column', marginY: 3, gap: 2 }}
          >
            {children}

            <Button type='submit' variant='contained' sx={{ mt: 1 }}>
                {buttonText}
              </Button>
          </Box>
        </Window>
      );
}

export default FormWindow;