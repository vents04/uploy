const { IoIosSearch } = require("react-icons/io");
const { FaRoad } = require("react-icons/fa");
const { BiCar } = require("react-icons/bi");
const { CgProfile } = require("react-icons/cg");

const BottomNavigationData = {
    items: [
        {
            title: "Discover",
            icon: <IoIosSearch />
        },
        {
            title: "Rides",
            icon: <FaRoad />
        },
        {
            title: "Vehicles",
            icon: <BiCar />
        },
        {
            title: "Profile",
            icon: <CgProfile />
        },
    ]
};

module.exports = BottomNavigationData;