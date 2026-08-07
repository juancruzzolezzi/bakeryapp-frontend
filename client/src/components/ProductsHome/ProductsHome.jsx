import React from 'react';
import style from "./ProductsHome.module.css";

const ProductsHome = () => {
  return (
    <div className={style.MainConteiner}>
      
      <div className={style.grid}>

        <div className={style.destacado1}>
          <img src="/Chocotorta.jpg" alt="imagen" className={style.productImg1} />
          <div className={style.productDetail1}>
            <span className={style.nombre}>Personalizados</span>
          </div>
          
        </div>

        <div className={style.destacado2}>
          <img src="/Cookies.jpeg" alt="imagen" className={style.productImg2} />
          <div className={style.productDetail1}>
            <span className={style.nombre}> Todo </span>

            <div className={style.buttonCont}>
              <button>+</button>{1}<button>-</button>
            </div>

          </div>
        </div>

        <div className={style.destacado3}>
          <img src="/Maicena.jpg" alt="imagen" className={style.productImg2} />
          <div className={style.productDetail1}>
            <span className={style.nombre}>Combos</span>
            
            <div className={style.buttonCont}>
              <button>+</button>{1}<button>-</button>
            </div>
            
          </div>
        </div>

        <div className={style.destacado4}>
          <img src="/Medialunas.jpg" alt="imagen" className={style.productImg2} />
          <div className={style.productDetail1}>
            <span className={style.nombre}>Panaderia</span>
            
            <div className={style.buttonCont}>
              <button>+</button>{1}<button>-</button>
            </div>
              
          </div>
        </div>

        <div className={style.destacado5}>
          <img src="/Muffin.jpg" alt="imagen" className={style.productImg2} />
          <div className={style.productDetail1}>
            <span className={style.nombre}>Pasteleria</span>
            
            <div className={style.buttonCont}>
              <button>+</button>{1}<button>-</button>
            </div>
          
          </div>
        </div>

        <div className={style.destacado6}>
          <img src="/Tarta.jpeg" alt="imagen" className={style.productImg2} />
          <div className={style.productDetail1}>
            <span className={style.nombre}>Pasteleria</span>
            
            <div className={style.buttonCont}>
              <button>+</button>{1}<button>-</button>
            </div>
            
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default ProductsHome;