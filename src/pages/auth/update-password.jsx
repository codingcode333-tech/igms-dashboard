import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { changePass } from "@/services/auth";
import { logout } from "@/context/UserContext";

export function UpdatePassword() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const changePassword = () => {
    if (oldPassword.length == 0) {
      error('Old password is required!')
      return
    }
    if (newPassword.length == 0) {
      error('New password is required!')
      return
    }
    if (confirmPassword.length == 0) {
      error('Password password is required!')
      return
    }
    if (newPassword != confirmPassword) {
      error('Password confirmation is incorrect!')
      return
    }

    changePass(oldPassword, newPassword)
      .then(() => {
        success("Password updated successfully!")
        setTimeout(logout, 2000)
      })
  }

  const error = message => toast(message, {
    type: "error"
  })

  const success = message => toast(message, {
    type: "success"
  })

  return (
    <>
      <div className="absolute inset-0 z-0 h-full w-full bg-white" />

      <div className="container mx-auto p-4">
        <Card className="absolute top-2/4 left-2/4 w-full max-w-[28rem] -translate-y-2/4 -translate-x-2/4">
          <CardHeader
            variant="gradient"
            color="blue"
            className="mb-4 grid h-28 place-items-center"
          >
            <Typography variant="h3" color="white">
              Change Your Password
            </Typography>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <Input type="password" label="Old Password" size="lg" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />

            <Input type="password" label="New Password" size="lg" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />

            <Input type="password" label="Confirm New Password" size="lg" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </CardBody>
          <CardFooter className="pt-0">
            <Button variant="gradient" className="text-md" fullWidth onClick={changePassword}>
              Submit
            </Button>
            {/* <Typography variant="small" className="mt-6 flex justify-center">
              Check your new password by sign in again.
              
            </Typography> */}
          </CardFooter>
        </Card>
      </div>

      <ToastContainer />
    </>
  );
}

export default UpdatePassword
