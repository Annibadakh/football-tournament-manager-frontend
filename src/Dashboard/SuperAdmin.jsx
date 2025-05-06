import { useState } from "react";
import api from "../Api";


export default function SuperAdmin(){
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        contactNum: "",
        password: "",
      });
    
      const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        const payload ={
            ...formData,
            password: formData.email,
            role: "admin",
        }
        try {
          const res = await api.post("/auth/register", payload);
          alert("Registration successful!");
          console.log(res.data);
          
        } catch (err) {
          alert("Registration failed.");
          console.error(err);
        }
        finally{
            setFormData({
                name: "",
                email: "",
                contactNum: "",
                password: "",
              })
        }
      };
    
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4"
          >
            <h2 className="text-2xl font-bold mb-4 text-center">Register Admin</h2>
    
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
    
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
    
            <input
              type="text"
              name="contactNum"
              placeholder="Contact Number"
              value={formData.contactNum}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
    
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Submit
            </button>
          </form>
        </div>
      );
}