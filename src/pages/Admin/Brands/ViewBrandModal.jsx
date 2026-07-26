import "../../../css/admin/BrandModal.css";


const ViewBrandModal = ({
    open,
    brand,
    onClose
}) => {


    if (!open || !brand) return null;


    return (

        <div className="modal-overlay">


            <div className="modal-container">


                <div className="modal-header">

                    <h2>
                        Brand Details
                    </h2>


                    <button
                        className="close-btn"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </div>



                <div className="modal-body">


                    <div className="view-item">


                        <label>
                            Brand ID
                        </label>


                        <p>
                            {brand.id}
                        </p>


                    </div>



                    <div className="view-item">


                        <label>
                            Brand Name
                        </label>


                        <p>
                            {brand.name}
                        </p>


                    </div>



                    <div className="view-item">


                        <label>
                            Logo
                        </label>


                        {

                            brand.logo ?

                            (
                                <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    className="view-brand-logo"
                                />
                            )

                            :

                            (

                                <p>
                                    No logo
                                </p>

                            )

                        }


                    </div>




                    <div className="view-item">


                        <label>
                            Created At
                        </label>


                        <p>

                            {
                                new Date(
                                    brand.created_at
                                ).toLocaleString()

                            }

                        </p>


                    </div>



                </div>




                <div className="modal-footer">


                    <button
                        className="cancel-btn"
                        onClick={onClose}
                    >

                        Close

                    </button>


                </div>



            </div>



        </div>

    );

};


export default ViewBrandModal;