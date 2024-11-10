import { Box, Dialog, DialogContent } from '@mui/material';


function Window({ isOpen, onClose, sx, children }){

  // Guard clause to prevent opening multiple windows:
  if (!isOpen) return null;
  
  return (
    <Box sx={{ maxWidth: sx?.maxWidth || 'xs', ...sx }}>
      <Dialog
        open={isOpen}
        onClose={onClose}
        fullWidth
        // Using the maxWidth prop directly
        maxWidth={sx?.maxWidth || 'xs'}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 2, pt: 3 }}>
          <DialogContent sx={{ width: '100%', padding: 0 }}>
            {children}
          </DialogContent>
        </Box>
      </Dialog>
    </Box>
  );
}

export default Window;