import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import style from "./Home.module.css";
import NavBarHome from "../../components/Navs/NavBarHome/NavBarHome";
import { emptyCart } from "../../redux/slice/homeSlice";
// import ProductsHome from "../../components/ProductsHome/ProductsHome";

function Home() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  //Si volvemos de un pago aprobado, vaciamos el carrito y limpiamos la URL
  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      dispatch(emptyCart());
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, dispatch, setSearchParams]);

  return (
    <div className={style.mainContainer}>
      <NavBarHome />
      <div className={style.design}>
        <div className={style.presentacion}>
          <h1>BakeryApp</h1>
          <h2>[baked goods & cookies]</h2>
        </div>
      </div>
      {/* <ProductsHome/> */}
    </div>
  );
}

export default Home;