import toast from "react-hot-toast";

const useToast = () => {
  const showToast = (message: string) => {
    toast.dismiss();

    toast(message, {
      icon: "🔥",
      duration: 2000,
      style: {
        borderRadius: "10px",
        background: "#2589E6",
        color: "#fff",
      },
    });
  };

  return {
    showToast,
  };
};

export default useToast;
