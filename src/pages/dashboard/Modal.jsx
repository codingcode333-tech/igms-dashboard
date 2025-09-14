import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-tailwind/react';

export function Modal({ isOpen, onClose }){
    return (
      <Dialog open={isOpen} onClose={onClose}>
        <DialogTitle>Modal Title</DialogTitle>
        <DialogContent>
          <p>Modal Content</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default Modal;
  