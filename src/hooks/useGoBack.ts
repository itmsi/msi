import { useNavigate } from "react-router";

const useGoBack = () => {
    const navigate = useNavigate();

    const goBack = (link: string = '/') => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate(link);
        }
    };

  return goBack;
};

export default useGoBack;
