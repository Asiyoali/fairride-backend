const User = require("../models/User");
const Driver = require("../models/Driver");
const generateToken = require("../utils/generateToken");

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      licenseNumber,
      carNumber,
      carModel
    } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || "passenger"
    });

    let driverProfile = null;

    if (user.role === "driver") {
      if (!licenseNumber || !carNumber || !carModel) {
        await User.findByIdAndDelete(user._id);

        return res.status(400).json({
          message: "Driver must provide licenseNumber, carNumber and carModel"
        });
      }

      driverProfile = await Driver.create({
        userId: user._id,
        licenseNumber,
        carNumber,
        carModel,
        status: "offline",
        isApproved: false
      });
    }

    res.status(201).json({
      message:
        user.role === "driver"
          ? "Driver registered. Waiting for admin approval."
          : "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      driverProfile,
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    let driverProfile = null;

    if (user.role === "driver") {
      driverProfile = await Driver.findOne({
        userId: user._id
      });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      driverProfile,
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const profile = async (req, res) => {
  res.json({
    user: req.user
  });
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json(users);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone })
      },
      {
        new: true,
        runValidators: true
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      message: "User updated successfully",
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      message: "User deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  profile,
  getAllUsers,
  updateUser,
  deleteUser
};