import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import './cardHome.css';

function BasicExample({title, description, imgSrc}) {
  return (
    <div className='justify-content-center align-items-center mt-5 p-2'>
    <Card className="custom-card  text-center  " style={{ maxWidth: '18rem', margin: '0 auto' }}>
      <Card.Img variant="top" src={imgSrc} alt={title} />
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text>
          {description}
        </Card.Text>

      </Card.Body>
    </Card>
    </div>
  );
}

export default BasicExample;