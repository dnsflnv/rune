import { useParams } from 'react-router';

const Runestone = () => {
  const { slug } = useParams();
  return <div>Runestone {slug}</div>;
};

export default Runestone;
